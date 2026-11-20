import math
import random
from typing import List, Dict, Set, Optional, Tuple
from enum import Enum
from dataclasses import dataclass
import time

class Domain(Enum):
    SCIENCE = "科学"
    ART = "艺术"
    PHILOSOPHY = "哲学"
    TECHNOLOGY = "技术"
    SOCIETY = "社会"
    PERSONAL = "个人"

class EmotionType(Enum):
    JOY = "愉悦"
    SATISFACTION = "满足"
    EXCITEMENT = "兴奋"
    CURIOSITY = "好奇"
    FRUSTRATION = "挫折"

class ThinkingNode:
    """思维树节点，代表一个概念或想法"""
    def __init__(self, id: int, name: str, knowledge_density: float, 
                 depth: int, domain: Domain, parent_id: Optional[int] = None):
        self.id = id
        self.name = name
        self.knowledge_density = knowledge_density  # 知识密度 (0-10)
        self.depth = depth  # 思维深度 (0: 根节点, 越高越抽象)
        self.domain = domain
        self.parent_id = parent_id
        self.children: List[int] = []  # 子节点ID列表
        self.related_nodes: Dict[int, float] = {}  # 相关节点及关联强度
        self.creation_time = time.time()
        self.last_accessed = time.time()
        self.access_count = 0
        self.emotional_value = 0.0  # 情感价值 (0-1)
        
    def add_child(self, child_id: int):
        """添加子节点"""
        if child_id not in self.children:
            self.children.append(child_id)
            
    def add_relation(self, node_id: int, strength: float = 0.5):
        """添加相关节点"""
        self.related_nodes[node_id] = strength
        
    def access(self):
        """访问节点"""
        self.last_accessed = time.time()
        self.access_count += 1
        
    def calculate_importance(self) -> float:
        """计算节点重要性"""
        # 基于知识密度、深度、访问频率和情感价值
        recency_factor = 1.0 / (1.0 + math.log(1 + time.time() - self.last_accessed))
        return (self.knowledge_density * 0.4 + 
                self.depth * 0.3 + 
                math.log(1 + self.access_count) * 0.2 +
                self.emotional_value * 0.1) * recency_factor
        
    def __str__(self):
        return f"思维节点[{self.id}]: {self.name} (深度: {self.depth}, 密度: {self.knowledge_density:.2f}, 领域: {self.domain.value})"

class ThinkingTree:
    """个人的思维树"""
    def __init__(self, owner_name: str, capacity: int = 1000):
        self.owner_name = owner_name
        self.nodes: Dict[int, ThinkingNode] = {}
        self.next_node_id = 1
        self.root_nodes: Dict[Domain, int] = {}  # 各领域的根节点
        self.current_focus: Optional[int] = None  # 当前关注点
        self.domain_expertise: Dict[Domain, float] = {d: 0.0 for d in Domain}  # 各领域专长
        self.thinking_style = random.uniform(0.3, 0.8)  # 思维风格 (0: 广度优先, 1: 深度优先)
        
    def add_node(self, name: str, knowledge_density: float, depth: int, 
                 domain: Domain, parent_id: Optional[int] = None) -> ThinkingNode:
        """添加新节点"""
        node_id = self.next_node_id
        node = ThinkingNode(node_id, name, knowledge_density, depth, domain, parent_id)
        self.nodes[node_id] = node
        self.next_node_id += 1
        
        # 如果是根节点，记录到root_nodes
        if parent_id is None:
            self.root_nodes[domain] = node_id
        else:
            # 添加到父节点的子节点列表
            if parent_id in self.nodes:
                self.nodes[parent_id].add_child(node_id)
                
        # 更新领域专长
        self.domain_expertise[domain] = max(self.domain_expertise[domain], 
                                           depth * knowledge_density * 0.1)
        
        return node
    
    def set_focus(self, node_id: int):
        """设置当前关注点"""
        if node_id in self.nodes:
            self.current_focus = node_id
            self.nodes[node_id].access()
            
    def move_focus(self, target_domain: Optional[Domain] = None, 
                   depth_direction: int = 0) -> bool:
        """移动关注点
        
        Args:
            target_domain: 目标领域，None表示当前领域
            depth_direction: 深度方向 (-1: 向浅层, 0: 同级, 1: 向深层)
        """
        if self.current_focus is None:
            # 如果没有当前关注点，选择最重要的根节点
            if self.root_nodes:
                most_important = max(self.root_nodes.values(), 
                                   key=lambda id: self.nodes[id].calculate_importance())
                self.set_focus(most_important)
                return True
            return False
            
        current_node = self.nodes[self.current_focus]
        target_domain = target_domain or current_node.domain
        
        # 寻找新关注点
        candidate_nodes = []
        
        if depth_direction == -1:  # 向浅层移动
            # 寻找父节点或同领域较浅节点
            if current_node.parent_id:
                candidate_nodes.append(current_node.parent_id)
                
            # 同领域较浅节点
            for node in self.nodes.values():
                if (node.domain == target_domain and 
                    node.depth < current_node.depth and
                    node.id != current_node.id):
                    candidate_nodes.append(node.id)
                    
        elif depth_direction == 1:  # 向深层移动
            # 优先选择子节点
            candidate_nodes.extend(current_node.children)
            
            # 同领域较深节点
            for node in self.nodes.values():
                if (node.domain == target_domain and 
                    node.depth > current_node.depth and
                    node.id != current_node.id):
                    candidate_nodes.append(node.id)
                    
        else:  # 同级移动
            # 同深度同领域节点
            for node in self.nodes.values():
                if (node.domain == target_domain and 
                    node.depth == current_node.depth and
                    node.id != current_node.id):
                    candidate_nodes.append(node.id)
                    
            # 相关节点
            candidate_nodes.extend(current_node.related_nodes.keys())
        
        if not candidate_nodes:
            return False
            
        # 根据思维风格选择节点
        if self.thinking_style > 0.5:  # 深度优先思维
            # 优先选择知识密度高的节点
            best_node = max(candidate_nodes, 
                          key=lambda id: self.nodes[id].knowledge_density)
        else:  # 广度优先思维
            # 优先选择相关性强的节点
            best_node = max(candidate_nodes, 
                          key=lambda id: current_node.related_nodes.get(id, 0.0))
            
        self.set_focus(best_node)
        return True
    
    def expand_tree(self, new_node_name: str, knowledge_density: float, 
                   domain: Optional[Domain] = None) -> bool:
        """拓展思维树（创造新节点）"""
        if self.current_focus is None:
            return False
            
        current_node = self.nodes[self.current_focus]
        domain = domain or current_node.domain
        
        # 新节点的深度通常比当前节点深1级
        new_depth = current_node.depth + 1
        
        # 创建新节点
        new_node = self.add_node(new_node_name, knowledge_density, new_depth, domain, self.current_focus)
        
        # 将新节点与当前节点关联
        current_node.add_relation(new_node.id, strength=0.8)
        
        # 寻找其他相关节点
        for node in self.nodes.values():
            if (node.domain == domain and 
                abs(node.depth - new_depth) <= 2 and
                node.id != new_node.id):
                # 计算关联强度
                depth_diff = abs(node.depth - new_depth)
                strength = 0.7 / (1 + depth_diff)
                new_node.add_relation(node.id, strength)
                node.add_relation(new_node.id, strength)
                
        # 设置新节点为关注点
        self.set_focus(new_node.id)
        
        return True
    
    def find_resonance_nodes(self, other_tree: 'ThinkingTree', 
                           domain: Optional[Domain] = None, 
                           min_depth: int = 3) -> List[Tuple[int, int, float]]:
        """寻找与另一个思维树的共鸣节点
        
        Returns:
            List of (node_id1, node_id2, resonance_strength) tuples
        """
        resonance_pairs = []
        
        # 确定搜索领域
        search_domains = [domain] if domain else Domain
        
        for dom in search_domains:
            # 寻找两个树中在指定领域深度>=min_depth的节点
            my_deep_nodes = [n for n in self.nodes.values() 
                           if n.domain == dom and n.depth >= min_depth]
            other_deep_nodes = [n for n in other_tree.nodes.values() 
                              if n.domain == dom and n.depth >= min_depth]
            
            for my_node in my_deep_nodes:
                for other_node in other_deep_nodes:
                    # 计算共鸣强度
                    resonance = self.calculate_resonance(my_node, other_node)
                    if resonance > 0.6:  # 共鸣阈值
                        resonance_pairs.append((my_node.id, other_node.id, resonance))
                        
        # 按共鸣强度排序
        resonance_pairs.sort(key=lambda x: x[2], reverse=True)
        return resonance_pairs
    
    def calculate_resonance(self, node1: ThinkingNode, node2: ThinkingNode) -> float:
        """计算两个节点间的共鸣强度"""
        if node1.domain != node2.domain:
            return 0.0
            
        # 基础共鸣：深度和知识密度的相似性
        depth_similarity = 1.0 / (1.0 + abs(node1.depth - node2.depth))
        density_similarity = 1.0 / (1.0 + abs(node1.knowledge_density - node2.knowledge_density))
        
        # 节点名称的语义相似性（简化处理）
        name_similarity = 0.0
        words1 = set(node1.name.lower().split())
        words2 = set(node2.name.lower().split())
        if words1 and words2:
            name_similarity = len(words1.intersection(words2)) / len(words1.union(words2))
        
        # 综合共鸣强度
        resonance = (depth_similarity * 0.4 + 
                    density_similarity * 0.4 + 
                    name_similarity * 0.2)
        
        return resonance
    
    def get_domain_depth(self, domain: Domain) -> int:
        """获取在某个领域的最大深度"""
        domain_nodes = [n for n in self.nodes.values() if n.domain == domain]
        if not domain_nodes:
            return 0
        return max(n.depth for n in domain_nodes)
    
    def get_tree_stats(self) -> Dict:
        """获取思维树统计信息"""
        stats = {
            "total_nodes": len(self.nodes),
            "domain_depths": {d.value: self.get_domain_depth(d) for d in Domain},
            "domain_node_counts": {d.value: len([n for n in self.nodes.values() if n.domain == d]) for d in Domain},
            "average_knowledge_density": sum(n.knowledge_density for n in self.nodes.values()) / len(self.nodes) if self.nodes else 0,
            "max_depth": max(n.depth for n in self.nodes.values()) if self.nodes else 0,
        }
        return stats

class Person:
    """模拟一个人及其思维过程"""
    def __init__(self, name: str, cognitive_style: float = None):
        self.name = name
        self.thinking_tree = ThinkingTree(name)
        self.cognitive_style = cognitive_style if cognitive_style is not None else random.uniform(0.3, 0.8)
        self.thinking_tree.thinking_style = self.cognitive_style
        self.emotional_state: Dict[EmotionType, float] = {e: 0.0 for e in EmotionType}
        self.friends: Dict[str, float] = {}  # 朋友及亲密度
        self.conversation_history: List[Dict] = []
        
        # 初始化思维树的基本结构
        self._initialize_tree()
    
    def _initialize_tree(self):
        """初始化思维树的基本结构"""
        # 为每个领域创建根节点
        for domain in Domain:
            root_name = f"{domain.value}基础"
            root_node = self.thinking_tree.add_node(
                root_name, knowledge_density=1.0, depth=0, domain=domain
            )
            
        # 设置初始关注点
        initial_focus = self.thinking_tree.root_nodes[Domain.SCIENCE]
        self.thinking_tree.set_focus(initial_focus)
    
    def think(self, intensity: float = 0.5) -> EmotionType:
        """进行思考，可能拓展思维树或移动关注点"""
        # 决定思考类型：拓展深度 vs 移动关注点
        think_type = random.choices(
            ["expand", "move"], 
            weights=[intensity, 1-intensity]
        )[0]
        
        emotion = None
        current_focus = self.thinking_tree.nodes.get(self.thinking_tree.current_focus)
        
        if think_type == "expand" and current_focus:
            # 尝试拓展思维树
            success = self.thinking_tree.expand_tree(
                f"新想法-{random.randint(1000,9999)}",
                knowledge_density=current_focus.knowledge_density * random.uniform(0.8, 1.2),
                domain=current_focus.domain
            )
            if success:
                emotion = EmotionType.SATISFACTION
                self._add_emotion(emotion, 0.3)
        else:
            # 移动关注点
            domain = random.choice(list(Domain)) if random.random() < 0.3 else None
            depth_dir = random.choice([-1, 0, 1])
            success = self.thinking_tree.move_focus(domain, depth_dir)
            if success:
                emotion = EmotionType.CURIOSITY
                self._add_emotion(emotion, 0.2)
                
        return emotion
    
    def converse_with(self, other: 'Person', topic_domain: Domain = None) -> Dict:
        """与另一个人交流"""
        # 寻找共鸣节点
        resonance_pairs = self.thinking_tree.find_resonance_nodes(
            other.thinking_tree, topic_domain, min_depth=3
        )
        
        conversation = {
            "participants": [self.name, other.name],
            "topic_domain": topic_domain.value if topic_domain else "任意",
            "resonance_found": len(resonance_pairs) > 0,
            "resonance_strength": resonance_pairs[0][2] if resonance_pairs else 0.0,
            "deep_connection": False
        }
        
        if resonance_pairs:
            # 找到共鸣，交流愉快
            resonance_strength = resonance_pairs[0][2]
            
            if resonance_strength > 0.8:  # 强烈共鸣
                conversation["deep_connection"] = True
                self._add_emotion(EmotionType.JOY, resonance_strength)
                other._add_emotion(EmotionType.JOY, resonance_strength)
                
                # 建立或加强友谊
                friendship = self.friends.get(other.name, 0.0)
                self.friends[other.name] = min(1.0, friendship + resonance_strength * 0.2)
                other.friends[self.name] = min(1.0, friendship + resonance_strength * 0.2)
                
                # 交换概念（互相学习）
                my_node_id, other_node_id, strength = resonance_pairs[0]
                self._learn_from(other, other_node_id)
                other._learn_from(self, my_node_id)
                
            else:  # 一般共鸣
                self._add_emotion(EmotionType.SATISFACTION, resonance_strength * 0.5)
                other._add_emotion(EmotionType.SATISFACTION, resonance_strength * 0.5)
        else:
            # 没有找到共鸣，可能有些挫折
            self._add_emotion(EmotionType.FRUSTRATION, 0.1)
            other._add_emotion(EmotionType.FRUSTRATION, 0.1)
            
        self.conversation_history.append(conversation)
        other.conversation_history.append(conversation)
        
        return conversation
    
    def _learn_from(self, other: 'Person', node_id: int):
        """从另一个人那里学习一个概念"""
        if node_id not in other.thinking_tree.nodes:
            return
            
        source_node = other.thinking_tree.nodes[node_id]
        
        # 检查是否已存在类似概念
        similar_exists = False
        for my_node in self.thinking_tree.nodes.values():
            if (my_node.domain == source_node.domain and 
                abs(my_node.depth - source_node.depth) <= 1 and
                self.thinking_tree.calculate_resonance(my_node, source_node) > 0.7):
                similar_exists = True
                break
                
        if not similar_exists:
            # 创建新节点（学习）
            new_node = self.thinking_tree.add_node(
                source_node.name + "（学习）",
                source_node.knowledge_density * 0.9,  # 学习的概念密度稍低
                source_node.depth,
                source_node.domain
            )
            
            # 设置为新关注点
            self.thinking_tree.set_focus(new_node.id)
    
    def _add_emotion(self, emotion: EmotionType, intensity: float):
        """添加情绪"""
        self.emotional_state[emotion] = min(1.0, self.emotional_state[emotion] + intensity)
        
        # 情绪自然衰减（除了新添加的情绪）
        for e in EmotionType:
            if e != emotion:
                self.emotional_state[e] *= 0.9  # 衰减10%
    
    def get_status(self) -> Dict:
        """获取当前状态"""
        dominant_emotion = max(self.emotional_state.items(), key=lambda x: x[1])
        tree_stats = self.thinking_tree.get_tree_stats()
        
        return {
            "name": self.name,
            "dominant_emotion": dominant_emotion[0].value if dominant_emotion[1] > 0.1 else "平静",
            "emotion_intensity": dominant_emotion[1],
            "cognitive_style": "深度优先" if self.cognitive_style > 0.5 else "广度优先",
            "friends_count": len(self.friends),
            "close_friends": [name for name, intimacy in self.friends.items() if intimacy > 0.7],
            "thinking_tree_stats": tree_stats,
            "current_focus": str(self.thinking_tree.nodes.get(self.thinking_tree.current_focus, "无"))
        }

# 模拟知己形成过程
def simulate_soulmate_formation():
    """模拟两个人在偏僻分支的高思维节点上找到共鸣，成为知己的过程"""
    print("=== 知己形成模拟 ===")
    
    # 创建两个人
    alice = Person("Alice", cognitive_style=0.7)  # 深度思考者
    bob = Person("Bob", cognitive_style=0.6)     # 偏深度思考者
    
    # 让他们在冷门领域（哲学）发展深度思维
    philosophy_domain = Domain.PHILOSOPHY
    
    print("\n--- 初始状态 ---")
    print(f"Alice: {alice.get_status()['dominant_emotion']}")
    print(f"Bob: {bob.get_status()['dominant_emotion']}")
    
    # 第一阶段：各自发展哲学领域的深度思维
    print("\n--- 第一阶段：各自发展深度思维 ---")
    for i in range(20):
        alice.think(intensity=0.8)  # 高强度思考，倾向于拓展深度
        bob.think(intensity=0.7)
        
        # 偶尔在哲学领域思考
        if random.random() < 0.3:
            alice.thinking_tree.move_focus(philosophy_domain, 1)
        if random.random() < 0.3:
            bob.thinking_tree.move_focus(philosophy_domain, 1)
    
    print(f"Alice哲学深度: {alice.thinking_tree.get_domain_depth(philosophy_domain)}")
    print(f"Bob哲学深度: {bob.thinking_tree.get_domain_depth(philosophy_domain)}")
    
    # 第二阶段：开始交流，寻找共鸣
    print("\n--- 第二阶段：交流寻找共鸣 ---")
    deep_connection_formed = False
    conversation_count = 0
    
    while not deep_connection_formed and conversation_count < 10:
        conversation = alice.converse_with(bob, philosophy_domain)
        conversation_count += 1
        
        print(f"交流 {conversation_count}: {conversation['resonance_found']} "
              f"(强度: {conversation['resonance_strength']:.2f})")
        
        if conversation['deep_connection']:
            deep_connection_formed = True
            print("*** 深度连接形成！ ***")
    
    # 第三阶段：成为知己后的频繁交流
    if deep_connection_formed:
        print("\n--- 第三阶段：知己间的频繁交流 ---")
        for i in range(5):
            conversation = alice.converse_with(bob, philosophy_domain)
            print(f"知己交流 {i+1}: 共鸣强度 {conversation['resonance_strength']:.2f}")
    
    # 最终状态
    print("\n--- 最终状态 ---")
    alice_status = alice.get_status()
    bob_status = bob.get_status()
    
    print(f"Alice: {alice_status['dominant_emotion']} (强度: {alice_status['emotion_intensity']:.2f})")
    print(f"Bob: {bob_status['dominant_emotion']} (强度: {bob_status['emotion_intensity']:.2f})")
    print(f"Alice的好友数: {alice_status['friends_count']}")
    print(f"Bob的好友数: {bob_status['friends_count']}")
    print(f"Alice的密友: {alice_status['close_friends']}")
    print(f"Bob的密友: {bob_status['close_friends']}")
    
    # 思维树统计
    print("\n--- 思维树统计 ---")
    alice_stats = alice_status['thinking_tree_stats']
    bob_stats = bob_status['thinking_tree_stats']
    
    print(f"Alice总节点数: {alice_stats['total_nodes']}")
    print(f"Bob总节点数: {bob_stats['total_nodes']}")
    print(f"Alice哲学节点数: {alice_stats['domain_node_counts']['哲学']}")
    print(f"Bob哲学节点数: {bob_stats['domain_node_counts']['哲学']}")
    print(f"Alice哲学深度: {alice_stats['domain_depths']['哲学']}")
    print(f"Bob哲学深度: {bob_stats['domain_depths']['哲学']}")

# 运行模拟
if __name__ == "__main__":
    simulate_soulmate_formation()